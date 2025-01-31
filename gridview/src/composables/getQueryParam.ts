/**
 * Get query parameter from URL
 * @param queryParamName target query parameter name
 * @param defaultValue default value if query parameter is not found
 * @returns query parameter value or default value 
 * @note this function does not support array type query parameter, and ssr environment.
 */
export function getQueryParam<T>(queryParamName: string, defaultValue: T): T {
    const params = new URLSearchParams(window.location.search);
    const value = params.get(queryParamName);
    return value !== null ? parseValue<T>(value, defaultValue) : defaultValue;
}

function parseValue<T>(value: string, defaultValue: T): T {
    if (typeof defaultValue === "number") {
        return (isNaN(Number(value)) ? defaultValue : Number(value)) as T;
    } else if (typeof defaultValue === "boolean") {
        return (value === "true") as T;
    } else {
        return value as T;
    }
}
