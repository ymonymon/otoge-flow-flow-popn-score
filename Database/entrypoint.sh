#/bin/sh

# start SQL Server, start the script to create/setup the DB
/startup/db-init.sh & /opt/mssql/bin/permissions_check.sh /opt/mssql/bin/sqlservr
