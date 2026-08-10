// 短随机 ID 生成（终端输出/消息等内部 id，不要求唯一性强度）
export const uid = () => Math.random().toString(36).substring(2);
