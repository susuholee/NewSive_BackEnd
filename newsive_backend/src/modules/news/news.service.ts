import { Injectable, Inject, Logger, OnModuleInit, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cron } from '@nestjs/schedule';
import type { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class NewsService implements OnModuleInit {
  private readonly logger = new Logger(NewsService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}


  async onModuleInit() {
    await this.refreshTopNews();
  }

  @Cron('*/30 * * * *')
  async refreshTopNews() {
    const cacheKey = 'news:top';

    try {
      this.logger.log('Cron: refreshing top news from GNews API');

      const baseUrl = process.env.GNEWS_API_BASE_URL;
      const apiKey = process.env.GNEWS_API_KEY;

      const url = `${baseUrl}/top-headlines?lang=ko&country=kr&max=10&apikey=${apiKey}`;

      const response = await firstValueFrom(this.httpService.get(url));
      const articles = response.data.articles || [];

      const mapped = articles.map(item => ({
        title: item.title,
        summary: item.description,
        originalLink: item.url,
        thumbnailUrl: item.image,
        sourceName: item.source?.name,
        publishedAt: new Date(item.publishedAt),
      }));

      for (const news of mapped) {
        try {
          await this.prisma.news.create({
            data: news,
          });
        } catch (e) {
        }
      }

      const limit = new Date();
      limit.setDate(limit.getDate() - 14);

      await this.prisma.news.deleteMany({
        where: {
          publishedAt: {
            lt: limit,
          },
        },
      });


      const latest = await this.prisma.news.findMany({
        orderBy: { publishedAt: 'desc' },
        take: 10,
      });


      await this.cacheManager.set(cacheKey, latest, { ttl: 1800 } as any);

      this.logger.log(`News refreshed. latest=${latest.length}`);
    } catch (error) {
      this.logger.error('Cron failed to refresh news', error);
    }
  }


  async getTopNews() {
    const cacheKey = 'news:top';


    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      this.logger.log('News cache hit');
      return cached;
    }

    this.logger.warn('News cache empty → fallback to DB');

   
    const latest = await this.prisma.news.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 10,
    });

  
    await this.cacheManager.set(cacheKey, latest, { ttl: 600 } as any);

    return latest;
  }






}
