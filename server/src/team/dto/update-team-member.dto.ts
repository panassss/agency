import { PartialType } from '@nestjs/swagger';
import { CreateTeamMemberDto } from './create-team-member.dto.js';

export class UpdateTeamMemberDto extends PartialType(CreateTeamMemberDto) {}
