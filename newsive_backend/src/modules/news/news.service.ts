import { Injectable, Inject, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(private readonly httpService: HttpService, @Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async getTopNews(forceRefresh = false) {
    const cacheKey = 'news:top';

    try {
        if (!forceRefresh) {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        this.logger.log('News cache hit');
        return cached;
      }
    } else {
        this.logger.log('Force refresh requested - skipping cache');
    }

      this.logger.log('News cache miss -> calling GNews API');

   
      const baseUrl = process.env.GNEWS_API_BASE_URL;
      const apiKey = process.env.GNEWS_API_KEY;

      const url = `${baseUrl}/top-headlines?lang=ko&country=kr&max=10&apikey=${apiKey}`;

      const response = await firstValueFrom(
        this.httpService.get(url),
      );

      const articles = response.data.articles || [];


      const mapped = articles.map((item, index) => ({
        id: index + 1,
        title: item.title,
        summary: item.description,
        originalLink: item.url,
        thumbnailUrl: item.image,
        sourceName: item.source?.name,
        publishedAt: item.publishedAt,
      }));


      await this.cacheManager.set(cacheKey, mapped, {ttl : 600} as any);

      return mapped;
    } catch (error) {
      this.logger.error('Failed to fetch news', error);

   
      const fallback = await this.cacheManager.get(cacheKey);
      if (fallback) {
        this.logger.warn('Returning cached news as fallback');
        return fallback;
      }

      throw error;
    }
  }
}
