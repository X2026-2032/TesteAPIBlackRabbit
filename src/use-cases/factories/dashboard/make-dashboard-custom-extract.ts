import { DashboardCustomExtractUseCase } from "@/use-cases/dashboard/dashboard-custom-extract";

export function makeDashboardCustomExtract() {
  return new DashboardCustomExtractUseCase();
}
