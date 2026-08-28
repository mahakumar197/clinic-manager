import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddWebNotificationFields1706091700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add notificationType column
    await queryRunner.addColumn(
      'notifications',
      new TableColumn({
        name: 'notificationType',
        type: 'enum',
        enum: [
          'recovery_form',
          'approval_reminder',
          'patient_message',
          'follow_up_reminder',
          'system_alert',
          'message_received',
          'task_created',
          'task_overdue',
          'form_submitted',
          'content_published',
        ],
        isNullable: true,
      }),
    );

    // Add priority column
    await queryRunner.addColumn(
      'notifications',
      new TableColumn({
        name: 'priority',
        type: 'enum',
        enum: ['normal', 'urgent'],
        default: "'normal'",
        isNullable: false,
      }),
    );

    // Add notificationStatus column
    await queryRunner.addColumn(
      'notifications',
      new TableColumn({
        name: 'notificationStatus',
        type: 'enum',
        enum: ['unread', 'read', 'dismissed'],
        default: "'unread'",
        isNullable: false,
      }),
    );

    // Add webUserId column
    await queryRunner.addColumn(
      'notifications',
      new TableColumn({
        name: 'webUserId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Add patientName column
    await queryRunner.addColumn(
      'notifications',
      new TableColumn({
        name: 'patientName',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // Add patientReference column
    await queryRunner.addColumn(
      'notifications',
      new TableColumn({
        name: 'patientReference',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // Add category column
    await queryRunner.addColumn(
      'notifications',
      new TableColumn({
        name: 'category',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // Add relatedEntityId column
    await queryRunner.addColumn(
      'notifications',
      new TableColumn({
        name: 'relatedEntityId',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // Add dueAt column
    await queryRunner.addColumn(
      'notifications',
      new TableColumn({
        name: 'dueAt',
        type: 'timestamp',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('notifications', 'notificationType');
    await queryRunner.dropColumn('notifications', 'priority');
    await queryRunner.dropColumn('notifications', 'notificationStatus');
    await queryRunner.dropColumn('notifications', 'webUserId');
    await queryRunner.dropColumn('notifications', 'patientName');
    await queryRunner.dropColumn('notifications', 'patientReference');
    await queryRunner.dropColumn('notifications', 'category');
    await queryRunner.dropColumn('notifications', 'relatedEntityId');
    await queryRunner.dropColumn('notifications', 'dueAt');
  }
}
