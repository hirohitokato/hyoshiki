import { useMemo } from "react";

/**
 * クエリパラメータを取得するカスタムフック
 * @param paramName 取得するパラメータ名
 * @param defaultValue 見つからなかった場合のデフォルト値
 * @returns パラメータの値
 */
export function useQueryParam<T>(paramName: string, defaultValue: T): T {

  const value = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const paramValue = params.get(paramName);
    return paramValue !== null ? parseValue(paramValue, defaultValue) : defaultValue;
  }, [paramName, defaultValue]);

  return value;
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
