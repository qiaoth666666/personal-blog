/**
 * IP 地理位置查询 —— 获取省、市两级信息
 * 使用 ip-api.com 免费服务（非商业用途，45次/分钟）
 */

interface GeoIPResult {
  province: string | null
  city: string | null
}

/**
 * 判断是否为本地或内网 IP
 */
function isLocalOrPrivateIP(ip: string): boolean {
  // 移除 IPv6 前缀
  const cleanIP = ip.replace(/^::ffff:/, '')
  return (
    cleanIP === '127.0.0.1' ||
    cleanIP === '::1' ||
    cleanIP === 'localhost' ||
    cleanIP.startsWith('192.168.') ||
    cleanIP.startsWith('10.') ||
    cleanIP.startsWith('172.16.') ||
    cleanIP.startsWith('172.17.') ||
    cleanIP.startsWith('172.18.') ||
    cleanIP.startsWith('172.19.') ||
    cleanIP.startsWith('172.20.') ||
    cleanIP.startsWith('172.21.') ||
    cleanIP.startsWith('172.22.') ||
    cleanIP.startsWith('172.23.') ||
    cleanIP.startsWith('172.24.') ||
    cleanIP.startsWith('172.25.') ||
    cleanIP.startsWith('172.26.') ||
    cleanIP.startsWith('172.27.') ||
    cleanIP.startsWith('172.28.') ||
    cleanIP.startsWith('172.29.') ||
    cleanIP.startsWith('172.30.') ||
    cleanIP.startsWith('172.31.') ||
    cleanIP === '0.0.0.0'
  )
}

/**
 * 从请求头中提取客户端真实 IP
 */
export function getClientIP(request: Request): string {
  // x-forwarded-for 可能包含多个 IP（经过多层代理），取第一个
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  // 部分反向代理使用 x-real-ip
  const realIP = request.headers.get('x-real-ip')
  if (realIP) return realIP.trim()
  // 无代理时返回本地地址
  return '127.0.0.1'
}

/**
 * 根据 IP 获取省、市信息
 * 本地/内网 IP 直接返回 null，不发起网络请求
 */
export async function getGeoInfo(ip: string): Promise<GeoIPResult> {
  if (isLocalOrPrivateIP(ip)) {
    return { province: null, city: null }
  }

  try {
    // ip-api.com 免费 HTTP API，支持中文
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?lang=zh-CN&fields=regionName,city`,
      { signal: AbortSignal.timeout(3000) },
    )
    if (!res.ok) return { province: null, city: null }

    const data = await res.json()
    return {
      province: data.regionName || null,
      city: data.city || null,
    }
  } catch {
    // 网络错误、超时等均静默降级
    return { province: null, city: null }
  }
}
