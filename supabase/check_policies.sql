-- Run this to see all RLS policies on client_requests
select policyname, cmd, qual, with_check
from pg_policies 
where tablename = 'client_requests';
