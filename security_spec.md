# Firestore Security Specification

## 1. Data Invariants
1. **Default-Deny Catch-All**: All unmatched paths are denied (`allow read, write: if false`).
2. **Public Catalog Integrity**: Anyone can read `/products/{productId}` and `/storefront/{configId}`, but ONLY a verified admin (`isAdmin()`) can create, update, or delete products or storefront settings.
3. **Order Integrity & PII Isolation**:
   - Anyone placing an order may create `/orders/{orderId}` ONLY if `status == 'pending'`, the referenced `productId` exists in `/products/{productId}`, `amount > 0`, `paymentMethod` is valid, `screenshotDataUrl` is a bounded `data:image/` URI (`<= 850000` chars), and `createdAt == request.time`.
   - Reading, listing, updating, or deleting `/orders/{orderId}` (which contains customer PII such as `customerName`, `customerWhatsapp`, `customerEmail`, and payment screenshots) is strictly restricted to `isAdmin()`.
4. **Admin RBAC & Anti-Spoofing**:
   - `isAdmin()` requires `request.auth != null`, AND either `(request.auth.token.email == 'ha933123456789@gmail.com' && request.auth.token.email_verified == true)` or `exists(/databases/$(database)/documents/admins/$(request.auth.uid))`.
   - Unverified emails or unauthenticated users can never gain admin access or register themselves into `/admins/{adminUid}`.

## 2. The "Dirty Dozen" Payloads (Expected: `PERMISSION_DENIED`)
1. **Unauthenticated Product Create**: Unauthenticated user attempts `create` on `/products/capcut-pro`.
2. **Ghost Field Injection on Order**: Customer includes extra field `isAdminApproved: true` when creating `/orders/order-1`.
3. **Pre-Paid Order Status Spoofing**: Customer submits `/orders/order-2` with `status: 'delivered'` instead of `'pending'`.
4. **Orphaned Order Product Reference**: Customer submits `/orders/order-3` referencing non-existent `productId: 'fake-product'`.
5. **Client Timestamp Forgery on Order**: Customer submits `/orders/order-4` with backdated `createdAt` string instead of `request.time`.
6. **Negative Price Injection**: Attacker attempts `/orders/order-5` with `amount: -500`.
7. **PII Leak via Order List**: Non-admin authenticated user calls `list` on `/orders`.
8. **PII Leak via Order Get**: Non-admin authenticated user calls `get` on `/orders/order-1`.
9. **Admin Email Spoofing**: Authenticated user with `email: 'ha933123456789@gmail.com'` and `email_verified: false` tries updating `/storefront/config`.
10. **Self-Assigned Admin Privilege Escalation**: Signed-in non-admin creates `/admins/$(uid)` with `role: 'admin'`.
11. **Path ID Poisoning**: User attempts creating `/orders/invalid$id!with/junk` or 200-char ID.
12. **Screenshot Denial-of-Wallet Oversized Payload**: Customer submits `/orders/order-6` with `screenshotDataUrl` > 850,000 characters or non-image prefix.
