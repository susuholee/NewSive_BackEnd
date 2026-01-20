import { Controller, Get, Query} from "@nestjs/common";
import { WeatherService  } from "./weather.service";


@Controller('weather')
export class WeatherController {
    constructor(private readonly weatherService: WeatherService){}

    @Get()
    async getWeather(@Query('city') city: string, @Query('refresh') refresh?: string) {
        const forceRefresh = refresh === 'true';
        return await this.weatherService.getWeather(city, forceRefresh);
    }

}