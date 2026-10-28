// 图片地址拼接（卡片与灯箱共用）。

function postImg(key: string | undefined, w = 800, h?: number): string {
  if (!key) return ''
  if (key.startsWith('data:') || key.startsWith('http')) return key
  return `https://images.unsplash.com/${key}?w=${w}${h ? `&h=${h}` : ''}&fit=crop&auto=format`
}

export { postImg }
