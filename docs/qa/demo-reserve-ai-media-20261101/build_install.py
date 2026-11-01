"""Build historical, guarded Sandbox-only image DML; does not connect to a database."""
import base64,hashlib,json,pathlib
root=pathlib.Path(__file__).parent
mapping=[]
for item in json.loads((root/"manifest.json").read_text()):
    raw=(root/item["file"]).read_bytes()
    assert hashlib.sha256(raw).hexdigest()==item["sha256"],item["file"]
    mapping.append({"key":item["key"],"old":item["old_url"],"new":"data:image/jpeg;base64,"+base64.b64encode(raw).decode()})
body=(root/"install-template.sql").read_text().replace("__IMAGE_MAPPINGS__",json.dumps(mapping,separators=(",",":"),ensure_ascii=False))
print("BEGIN;\n"+body+"\nCOMMIT;")
