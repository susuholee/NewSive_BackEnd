import { Controller, Get, Query } from '@nestjs/common';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async getTopNews(@Query('refresh') refresh?: string) {
    const forceRefresh = refresh === 'true';
    return  await this.newsService.getTopNews(forceRefresh);
  }
}
