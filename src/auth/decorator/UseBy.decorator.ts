import { SetMetadata } from "@nestjs/common";

export const UseBy = (...roles: string[]) => SetMetadata("roles", roles);
