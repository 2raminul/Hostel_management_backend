import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { AuthenticatedUserGuard } from '../auth/guard/authenticated.user.guard';
import { CurrentUser } from '@/common/decorator/loggedin-user.decorator';
import { RequestUser } from '../auth/type/request-user';
import { ExpenseQueryDto } from './dto/expense.query.dto';

@UseGuards(AuthenticatedUserGuard)
@Controller('expense')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post('add-expense')
  addExpense(
    @Body() createExpenseDto: CreateExpenseDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.expensesService.addExpense(createExpenseDto, user);
  }

  @Get('expense-list')
  getExpenseList(@Query() expenseQueryDto: ExpenseQueryDto) {
    return this.expensesService.getExpenseList(expenseQueryDto);
  }

  @Get('brands')
  getBrands() {
    return this.expensesService.findBrands();
  }
}
