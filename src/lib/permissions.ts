/**
 * Permissions Enum
 */
export enum Permission {
  // Book permissions
  BOOK_READ = 'book:read',
  BOOK_CREATE = 'book:create',
  BOOK_UPDATE = 'book:update',
  BOOK_DELETE = 'book:delete',

  // Member permissions
  MEMBER_READ = 'member:read',
  MEMBER_CREATE = 'member:create',
  MEMBER_UPDATE = 'member:update',
  MEMBER_DELETE = 'member:delete',

  // Borrowing permissions
  BORROWING_CREATE = 'borrowing:create',
  BORROWING_RETURN = 'borrowing:return',
  BORROWING_VIEW = 'borrowing:view',

  // E-book permissions
  EBOOK_READ = 'ebook:read',
  EBOOK_CREATE = 'ebook:create',
  EBOOK_DELETE = 'ebook:delete',

  // Admin permissions
  ADMIN_READ = 'admin:read',
  ADMIN_CREATE = 'admin:create',
  ADMIN_UPDATE = 'admin:update',
  ADMIN_DELETE = 'admin:delete',

  // System permissions
  LOGS_VIEW = 'logs:view',
  REPORTS_VIEW = 'reports:view',
  SETTINGS_MANAGE = 'settings:manage'
}

/**
 * Role-based permissions mapping
 */
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: [
    // All permissions
    ...Object.values(Permission)
  ],
  LIBRARIAN: [
    Permission.BOOK_READ,
    Permission.BOOK_CREATE,
    Permission.BOOK_UPDATE,
    Permission.MEMBER_READ,
    Permission.MEMBER_CREATE,
    Permission.MEMBER_UPDATE,
    Permission.BORROWING_CREATE,
    Permission.BORROWING_RETURN,
    Permission.BORROWING_VIEW,
    Permission.EBOOK_READ,
    Permission.EBOOK_CREATE,
    Permission.ADMIN_READ,
    Permission.LOGS_VIEW,
    Permission.REPORTS_VIEW
  ],
  ASSISTANT: [
    Permission.BOOK_READ,
    Permission.MEMBER_READ,
    Permission.BORROWING_CREATE,
    Permission.BORROWING_VIEW,
    Permission.EBOOK_READ,
    Permission.LOGS_VIEW
  ]
}

/**
 * Checks if a role has a specific permission
 */
export function hasPermission(role: string, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role]
  return rolePermissions?.includes(permission) || false
}

/**
 * Gets all permissions for a role
 */
export function getRolePermissions(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

/**
 * Role labels for display
 */
export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  LIBRARIAN: 'Pustakawan',
  ASSISTANT: 'Asisten'
}

/**
 * Status labels for display
 */
export const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Aktif',
  SUSPENDED: 'Ditangguhkan',
  DELETED: 'Dihapus'
}
