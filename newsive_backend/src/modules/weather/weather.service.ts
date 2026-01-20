import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getWeather(city: string, refresh = false) {
    if (!city) {
      throw new BadRequestException("city query parameter is required");
    }

    const normalizedCity = city.trim().toLowerCase();
    const cacheKey = `weather:${normalizedCity}`;

    if (!refresh) {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        this.logger.log('Weather cache hit');
        return cached;
      }
    }

    this.logger.log('Weather cache miss -> calling OpenWeather API');

    try {
      const url = `${process.env.OPEN_WEATHER_API_BASE_URL}/weather`;

      const res = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            q: normalizedCity,
            appid: process.env.OPEN_WEATHER_API_KEY,
            units: 'metric',
            lang: 'kr',
          },
        }),
      );

      const data = res.data;


      const weatherInfo = data.weather?.[0];
      if (!weatherInfo || !data.main) {
        this.logger.error('Invalid weather API response', data);
        throw new Error('Invalid weather data from OpenWeather');
      }

      const iconCode = weatherInfo.icon;

      const mapped = {
        city: data.name,
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        weather: weatherInfo.description,
        icon: iconCode,
        iconUrl: `https://openweathermap.org/img/wn/${iconCode}@2x.png`,
        updatedAt: new Date().toISOString(),
      };

      await this.cacheManager.set(cacheKey, mapped, 600);

      return mapped;
    } catch (error) {
      this.logger.error('Weather API error', error);

      const fallback = await this.cacheManager.get(cacheKey);
      if (fallback) {
        this.logger.warn('Returning cached weather as fallback');
        return fallback;
      }

      throw error;
    }
  }
}
