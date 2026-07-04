/**
 * 设备类型检测 —— 根据 User-Agent 判断访问设备
 */

export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown'

/**
 * 通过 User-Agent 字符串判断设备类型
 */
export function getDeviceType(userAgent: string | null): DeviceType {
  if (!userAgent) return 'unknown'

  const ua = userAgent.toLowerCase()

  // 平板优先判断（部分平板 UA 也包含 mobile 关键词）
  if (/ipad|tablet|kindle|silk|playbook/.test(ua)) {
    return 'tablet'
  }

  // 手机
  if (
    /mobile|android|iphone|ipod|blackberry|windows phone|opera mini|iemobile|webos/.test(
      ua,
    )
  ) {
    return 'mobile'
  }

  // 其余归为桌面
  return 'desktop'
}

/** 设备类型对应的中文标签 */
export const deviceLabels: Record<DeviceType, string> = {
  desktop: '电脑',
  mobile: '手机',
  tablet: '平板',
  unknown: '未知',
}
