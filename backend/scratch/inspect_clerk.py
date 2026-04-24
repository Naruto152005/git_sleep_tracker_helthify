import os
from dotenv import load_dotenv

load_dotenv()
try:
    import clerk_backend_api
    print(dir(clerk_backend_api))
    from clerk_backend_api import Clerk
    print(dir(Clerk))
except Exception as e:
    print(e)
