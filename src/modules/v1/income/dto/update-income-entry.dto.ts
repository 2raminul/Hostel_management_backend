import { PartialType } from '@nestjs/mapped-types';
import { CreateIncomeEntryDto } from './create-income-entry.dto';

export class UpdateIncomeEntryDto extends PartialType(CreateIncomeEntryDto) {}
