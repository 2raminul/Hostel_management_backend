import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CurrentUser } from '@/common/decorator/loggedin-user.decorator';
import { RequestUser } from '../auth/type/request-user';
import { AuthenticatedUserGuard } from '../auth/guard/authenticated.user.guard';
import { CategoryQueryDto } from './dto/category.query.dto';

@UseGuards(AuthenticatedUserGuard)
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.categoryService.create(createCategoryDto, user);
  }

  @Get()
  getCategoryList(@Query() categoryQueryDto: CategoryQueryDto) {
    return this.categoryService.getCategoryList(categoryQueryDto);
  }

  @Get('units')
  findUnits() {
    return this.categoryService.findUnits();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }
}
