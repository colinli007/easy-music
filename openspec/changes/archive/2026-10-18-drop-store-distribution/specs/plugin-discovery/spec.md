## REMOVED Requirements

### Requirement: 发现入口在 iOS 上不存在

**Reason**: 它只是 `plugin-source` 中「插件能力在 iOS 上完全不存在」在发现层的延伸，而那条要求已因不再上架应用商店而移除。

**Migration**: 发现入口随插件能力一起在 iOS 上提供，平台一致性由 `plugin-source` 的「插件能力在两端一致可用」统一约束，本能力不再单独规定平台差异。
