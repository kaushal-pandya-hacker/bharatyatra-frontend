import { Injectable, Logger } from '@nestjs/common';

export interface DeviceTokenRecord {
  deviceId: string;
  userId: string;
  platform: 'WEB' | 'ANDROID' | 'IOS';
  pushToken: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastSeen: Date;
  createdAt: Date;
}

@Injectable()
export class DeviceTokenService {
  private readonly logger = new Logger(DeviceTokenService.name);

  // In-memory store for registered device push tokens
  private readonly devices: Map<string, DeviceTokenRecord> = new Map();

  registerDevice(userId: string, platform: 'WEB' | 'ANDROID' | 'IOS', pushToken: string): DeviceTokenRecord {
    const deviceId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record: DeviceTokenRecord = {
      deviceId,
      userId,
      platform,
      pushToken,
      status: 'ACTIVE',
      lastSeen: new Date(),
      createdAt: new Date(),
    };
    this.devices.set(deviceId, record);
    this.logger.log(`Registered device token ${deviceId} for user ${userId} (${platform})`);
    return record;
  }

  getUserDevices(userId: string): DeviceTokenRecord[] {
    return Array.from(this.devices.values()).filter((d) => d.userId === userId && d.status === 'ACTIVE');
  }

  deactivateDevice(deviceId: string, userId: string): boolean {
    const device = this.devices.get(deviceId);
    if (device && device.userId === userId) {
      device.status = 'INACTIVE';
      this.logger.log(`Deactivated device token ${deviceId}`);
      return true;
    }
    return false;
  }
}
