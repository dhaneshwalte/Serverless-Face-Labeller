
export function replacePathParams(url, paramName, paramValue){
    return url?.replace(`{${paramName}}`, paramValue) || undefined;
}