#/bin/sh

# env
# echo "テスト"


# start SQL Server, start the script to create/setup the DB
# wait for the SQL Server to come up
echo "wait set up script"
sleep 60s

echo "running set up script"
# run the setup script to create the DB and the schema in the DB
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $SA_PASSWORD -d master -i /startup/db-init.sql -v USER_PST2_PASSWORD=$USER_PST2_PASSWORD -v USER_TEST_PASSWORD=$USER_TEST_PASSWORD
