# Database Backup Strategy

## MongoDB Atlas Automated Backups

MongoDB Atlas provides automated backups as part of their service. Configure this in your Atlas dashboard:

### Setup Steps:
1. Go to MongoDB Atlas Dashboard
2. Select your cluster
3. Navigate to "Backups" tab
4. Enable automated backups
5. Configure backup retention policy (recommended: 30 days)
6. Set backup window (recommended: off-peak hours)

### Backup Options:
- **Continuous Backups**: Point-in-time recovery (recommended for production)
- **Scheduled Snapshots**: Daily/weekly snapshots
- **Retention Period**: 7-90 days based on pricing tier

## Manual Backup Script

For additional manual backups, use this script:

```bash
# mongodump command for manual backup
mongodump --uri="MONGODB_URI" --out=./backups/$(date +%Y%m%d)

# Compress backup
tar -czf ./backups/backup_$(date +%Y%m%d).tar.gz ./backups/$(date +%Y%m%d)

# Upload to cloud storage (optional)
# aws s3 cp ./backups/backup_$(date +%Y%m%d).tar.gz s3://your-bucket/backups/
```

## Restore Procedure

### From Atlas Backup:
1. Go to Atlas Dashboard → Backups
2. Select the snapshot to restore
3. Choose restore point
4. Click "Restore" and select target cluster

### From Manual Backup:
```bash
# Decompress if needed
tar -xzf ./backups/backup_YYYYMMDD.tar.gz

# Restore to database
mongorestore --uri="MONGODB_URI" ./backups/YYYYMMDD
```

## Backup Schedule Recommendations

- **Production**: Daily automated backups + weekly manual verification
- **Staging**: Weekly automated backups
- **Development**: On-demand manual backups

## Monitoring

Set up alerts for:
- Backup failures
- Storage usage approaching limits
- Backup completion delays

## Disaster Recovery Plan

1. **RTO (Recovery Time Objective)**: 4 hours
2. **RPO (Recovery Point Objective)**: 24 hours (with daily backups)
3. **Test Restores**: Monthly verification of backup integrity
4. **Documentation**: Keep this document updated with any changes
