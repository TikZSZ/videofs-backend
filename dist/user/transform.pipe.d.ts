import { ArgumentMetadata, PipeTransform } from "@nestjs/common";
import { IJwtToken } from "src/global/types/JwtToken";
export declare class TransformResponsePipe implements PipeTransform {
    transform(value: IJwtToken, metadata: ArgumentMetadata): {
        name: string;
        id: number;
    };
}
