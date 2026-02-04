import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateQuizSessionDto {
  @IsNotEmpty()
  @IsString()
  category: string;
}

export class AnswerQuizQuestionDto {
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @IsNotEmpty()
  selectedOption: string;
}
