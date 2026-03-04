import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsIn,
} from 'class-validator';

export class AnswerQuestionDto {
  @IsMongoId()
  @IsNotEmpty()
  questionId: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}

export class SubmitFeedbackDto {
  @IsMongoId()
  @IsNotEmpty()
  questionId: string;

  @IsIn(['like', 'dislike'])
  type: 'like' | 'dislike';
}
