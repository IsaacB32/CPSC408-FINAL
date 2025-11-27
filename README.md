Catan Database

to run a server and test out functionality download and install php and then run `php -S localhost:8000`

In order to get mysql working you must change the following code on line 12 of the `server.php` file to your mysql login info and schema name.
```php
$conn = new mysqli("localhost", "root", "CPSC408!", "CatanTest");
//$conn = new mysqli(<host_name>, <username>, <password>, <database_schema_name>);
```
you also must change the same statement on line 8 of the `app_player.php` file.


If `mysqli` cannot be found you might be missing some requirements, google to fix.

### Requirements
- [X] 1. Print/display records from your database/tables.
- [X] 2. Query for data/results with various parameters/filters
- [X] 3. Create a new record
- [X] 4. Delete records (soft delete function would be ideal)
- [X] 5. Update records
- [ ] 6. Make use of transactions (commit & rollback)
- [X] 7. Generate reports that can be exported (excel or csv format)
- [X] 8. One query must perform an aggregation/group-by clause
- [X] 9. One query must contain a subquery.
- [X] 10. Two queries must involve joins across at least 3 tables
- [ ] 11. Enforce referential integrality (PK/FK Constraints)
- [ ] 12. Include Database Views, Indexes
- [X] 13. Use at least 5 entities