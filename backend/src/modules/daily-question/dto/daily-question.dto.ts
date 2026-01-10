import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class AnswerQuestionDto {
  @IsMongoId()
  @IsNotEmpty()
  questionId: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}
