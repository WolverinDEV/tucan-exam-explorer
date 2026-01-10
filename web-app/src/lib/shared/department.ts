export function extractDepartmentIdFromModuleId(moduleId: string): string {
    return moduleId.split("-")[0];
}