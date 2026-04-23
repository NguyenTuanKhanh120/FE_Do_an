import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminUserService, AdminUser, PaginatedUsers } from '../../services/admin-user.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  private adminUserService = inject(AdminUserService);

  // Danh sách user hiển thị
  users = signal<AdminUser[]>([]);
  isLoading = signal<boolean>(false);

  // Phân trang
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  totalCount = signal<number>(0);
  pageSize = 10;

  // Bộ lọc
  searchQuery = '';
  selectedRole = '';

  // Modal đổi Role
  showRoleModal = signal<boolean>(false);
  selectedUser = signal<AdminUser | null>(null);
  newRole = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  /** Gọi API lấy danh sách user */
  loadUsers(): void {
    this.isLoading.set(true);
    this.adminUserService.getUsers(
      this.searchQuery,
      this.selectedRole,
      this.currentPage(),
      this.pageSize
    ).subscribe({
      next: (result: PaginatedUsers) => {
        this.users.set(result.users);
        this.totalPages.set(result.totalPages);
        this.totalCount.set(result.totalCount);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  /** Tìm kiếm — reset về trang 1 */
  onSearch(): void {
    this.currentPage.set(1);
    this.loadUsers();
  }

  /** Lọc theo Role */
  onRoleFilter(): void {
    this.currentPage.set(1);
    this.loadUsers();
  }

  /** Chuyển trang */
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadUsers();
  }

  /**
   * Optimistic UI — Toggle khóa/mở khóa:
   * 1. Lưu lại trạng thái cũ (backup)
   * 2. Cập nhật UI ngay lập tức (optimistic)
   * 3. Gửi API ngầm
   * 4. Nếu lỗi → rollback lại trạng thái cũ
   */
  toggleLock(user: AdminUser): void {
    // Bước 1: Backup trạng thái cũ
    const previousState = user.isLocked;

    // Bước 2: Cập nhật UI ngay (đảo trạng thái)
    this.updateUserInList(user.userId, { isLocked: !previousState });

    // Bước 3: Gọi API ngầm
    this.adminUserService.toggleUserStatus(user.userId).subscribe({
      next: (updated) => {
        // API thành công → cập nhật lại từ server cho chính xác
        this.updateUserInList(user.userId, updated);
      },
      error: () => {
        // Bước 4: Lỗi → Rollback lại trạng thái cũ
        this.updateUserInList(user.userId, { isLocked: previousState });
        alert('Failed to update user status. Please try again.');
      }
    });
  }

  /** Mở modal đổi Role */
  openRoleModal(user: AdminUser): void {
    this.selectedUser.set(user);
    this.newRole = user.role;
    this.showRoleModal.set(true);
  }

  /** Đóng modal */
  closeRoleModal(): void {
    this.showRoleModal.set(false);
    this.selectedUser.set(null);
  }

  /** Xác nhận đổi Role */
  confirmChangeRole(): void {
    const user = this.selectedUser();
    if (!user || this.newRole === user.role) {
      this.closeRoleModal();
      return;
    }

    this.adminUserService.changeUserRole(user.userId, this.newRole).subscribe({
      next: (updated) => {
        this.updateUserInList(user.userId, updated);
        this.closeRoleModal();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to change role.');
      }
    });
  }

  /** Helper: cập nhật 1 user trong danh sách (dùng cho Optimistic UI) */
  private updateUserInList(userId: number, changes: Partial<AdminUser>): void {
    this.users.update(list =>
      list.map(u => u.userId === userId ? { ...u, ...changes } : u)
    );
  }

  /** Format ngày tháng */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }
}
