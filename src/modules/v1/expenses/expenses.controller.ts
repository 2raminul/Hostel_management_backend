import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Param,
  Put,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { AuthenticatedUserGuard } from '../auth/guard/authenticated.user.guard';
import { CurrentUser } from '@/common/decorator/loggedin-user.decorator';
import { RequestUser } from '../auth/type/request-user';
import { ExpenseQueryDto } from './dto/expense.query.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseSummaryQueryDto } from './dto/expense-summary-query.dto';

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

  @Put('edit-expense')
  editExpense(
    @Body() updateExpenseDto: UpdateExpenseDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.expensesService.editExpense(updateExpenseDto, user);
  }

  @Get('expense-list')
  getExpenseList(@Query() expenseQueryDto: ExpenseQueryDto) {
    return this.expensesService.getExpenseList(expenseQueryDto);
  }

  @Get('summary')
  getExpenseSummary(@Query() q: ExpenseSummaryQueryDto) {
    return this.expensesService.getSummary(q.dateFrom, q.dateTo, q.categoryId);
  }

  @Get(':id')
  getExpenseDetail(@Param('id') id: string) {
    return this.expensesService.getExpenseDetail(+id);
  }

  @Get('expense-history/:expenseId')
  getExpenseHistory(@Param('expenseId') expenseId: string) {
    return this.expensesService.getExpenseHistory(+expenseId);
  }
}
