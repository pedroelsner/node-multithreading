autocannon -m POST -H "Content-Type: application/json" -b '{"sid":"cgRNo9w0PUjF","sortby": [{ "field": "t", "order": "desc"}],"filterby":[{ "field": "s.cn.keyword", "value": "Azul" },{ "field": "t", "math": "gte", "value": 500 }]}'-c 100 -p 4 http://localhost:3000/search/filter