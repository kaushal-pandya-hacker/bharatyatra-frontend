import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationService } from './notification.service';

@ApiTags('Supplier Notifications')
@Controller('supplier/notifications')
export class SupplierNotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get Tenant-Isolated Supplier Notification Inbox' })
  getSupplierNotifications(@Query('supplierId') supplierId: string = 'sup_gujarattravels_01') {
    return this.notificationService.getSupplierNotifications(supplierId);
  }
}
