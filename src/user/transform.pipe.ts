import { ArgumentMetadata, PipeTransform } from "@nestjs/common";
import { IJwtToken } from "src/global/types/JwtToken";

export class TransformResponsePipe implements PipeTransform {
  transform(value: IJwtToken, metadata: ArgumentMetadata) {
    return {
      name:value.name,
      id:value.id
    }
  }
}