export function timeStamp(): string {
    const d = new Date();
    return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
}


/**
 * Sleep function for test usage
 * @param ms 
 * @returns 
 */
export async function sleep(ms: number): Promise<void> {
    await new Promise((res) => setTimeout(res, ms || 1000));
    return;
}