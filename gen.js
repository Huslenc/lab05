const fs=require('fs');
const hdr=[{key:'Content-Type',value:'application/json'}];
const req=(name,method,path,body,tests,raw)=>({name,event:[{listen:'test',script:{type:'text/javascript',exec:tests}}],
 request:{method,header:hdr,url:{raw:'{{baseUrl}}'+path,host:['{{baseUrl}}'],path:path.split('/').filter(Boolean)},
 body:{mode:'raw',raw:raw!==undefined?raw:JSON.stringify(body),options:{raw:{language:'json'}}}}});
const putOK=(n,p,b)=>req(n,'PUT',p,b,['pm.test("setup: статус 200",()=>pm.response.to.have.status(200));','pm.test("setup: result == OK",()=>pm.expect(pm.response.json().result).to.eql("OK"));']);
const post=(n,b,st,res,extra=[],raw)=>req(n,'POST','/registrations',b,[
 `pm.test("${n} — статус ${st}",()=>pm.response.to.have.status(${st}));`,
 `pm.test("${n} — result == ${res}",()=>pm.expect(pm.response.json().result).to.eql(${res.startsWith('{{')?'pm.variables.get("'+res.slice(2,-2)+'")':'"'+res+'"'}));`,...extra],raw);
const F=(name,items)=>({name,item:items});
const mkCollection=(fail)=>({
 info:{name:'Lab05 Registration API'+(fail?' (FAIL)':''),schema:'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'},
 variable:[{key:'baseUrl',value:'http://localhost:3000'},
  {key:'expDoubleNoStudentNoCourse',value:'ERROR_NO_STUDENT'},
  {key:'expDoubleInactivePrereq',value:'ERROR_INACTIVE_STUDENT'}],
 item:[
 F('T1 Happy path',[putOK('setup оюутан','/students/B_T1',{status:'active',coursesTaken:['CS201']}),putOK('setup хичээл','/courses/CS313_T1',{prerequisites:['CS201']}),
  post('T1 Идэвхтэй оюутан урьдач хангахад амжилттай бүртгэгдэнэ',{studentID:'B_T1',courseID:'CS313_T1'},fail?200:201,'OK',['pm.test("T1 registrationID тоо байна",()=>pm.expect(pm.response.json().registrationID).to.be.a("number"));'])]),
 F('T2 Оюутан байхгүй',[putOK('setup хичээл','/courses/CS313_T2',{prerequisites:[]}),post('T2 Байхгүй оюутан бүртгүүлэхэд ERROR_NO_STUDENT',{studentID:'NOSUCH_T2',courseID:'CS313_T2'},200,'ERROR_NO_STUDENT')]),
 F('T3 Оюутан идэвхгүй',[putOK('setup оюутан','/students/B_T3',{status:'inactive',coursesTaken:['CS201']}),putOK('setup хичээл','/courses/CS313_T3',{prerequisites:['CS201']}),post('T3 Идэвхгүй оюутан бүртгүүлэхэд ERROR_INACTIVE_STUDENT',{studentID:'B_T3',courseID:'CS313_T3'},200,'ERROR_INACTIVE_STUDENT')]),
 F('T4 Хичээл байхгүй',[putOK('setup оюутан','/students/B_T4',{status:'active',coursesTaken:['CS201']}),post('T4 Байхгүй хичээлд бүртгүүлэхэд ERROR_NO_COURSE',{studentID:'B_T4',courseID:'NOCOURSE_T4'},200,'ERROR_NO_COURSE')]),
 F('T5 Урьдач нөхцөл огт хангаагүй',[putOK('setup оюутан','/students/B_T5',{status:'active',coursesTaken:[]}),putOK('setup хичээл','/courses/CS313_T5',{prerequisites:['CS201']}),
  post('T5 Урьдач огт үзээгүй үед ERROR_PREREQUISITES',{studentID:'B_T5',courseID:'CS313_T5'},200,'ERROR_PREREQUISITES',['pm.test("T5 missing == [CS201]",()=>pm.expect(pm.response.json().missing).to.eql(["CS201"]));'])]),
 F('T6 Урьдач нөхцөл зарим нь дутуу',[putOK('setup оюутан','/students/B_T6',{status:'active',coursesTaken:['CS201']}),putOK('setup хичээл','/courses/CS313_T6',{prerequisites:['CS201','CS202']}),
  post('T6 Урьдачийн зарим нь дутуу үед ERROR_PREREQUISITES',{studentID:'B_T6',courseID:'CS313_T6'},200,'ERROR_PREREQUISITES',['pm.test("T6 missing == [CS202]",()=>pm.expect(pm.response.json().missing).to.eql(["CS202"]));'])]),
 F('T7 Давхар алдаа: оюутан ба хичээл хоёулаа байхгүй',[post('T7 Оюутан ба хичээл хоёул байхгүй үед тогтсон алдаа буцна',{studentID:'NOSUCH_T7',courseID:'NOCOURSE_T7'},200,'{{expDoubleNoStudentNoCourse}}')]),
 F('T8 Давхар алдаа: идэвхгүй оюутан + урьдач дутуу',[putOK('setup оюутан','/students/B_T8',{status:'inactive',coursesTaken:[]}),putOK('setup хичээл','/courses/CS313_T8',{prerequisites:['CS201']}),post('T8 Идэвхгүй оюутан + урьдач дутуу үед тогтсон алдаа буцна',{studentID:'B_T8',courseID:'CS313_T8'},200,'{{expDoubleInactivePrereq}}')]),
 F('T9 Хязгаар: урьдачгүй хичээл, хоосон coursesTaken',[putOK('setup оюутан','/students/B_T9',{status:'active',coursesTaken:[]}),putOK('setup хичээл','/courses/CS101_T9',{prerequisites:[]}),post('T9 Урьдачгүй хичээлд хоосон түүхтэй оюутан бүртгүүлж болно',{studentID:'B_T9',courseID:'CS101_T9'},201,'OK')]),
 F('T10 Хязгаар: courseID дутуу',[post('T10 courseID дутуу үед ERROR_BAD_REQUEST',{studentID:'B_T10'},400,'ERROR_BAD_REQUEST')]),
 F('T11 Хязгаар: буруу JSON',[post('T11 Буруу JSON үед ERROR_BAD_JSON',null,400,'ERROR_BAD_JSON',[],'{"studentID": "B_T11", ')]),
 ]});
fs.writeFileSync('lab05-collection.json',JSON.stringify(mkCollection(false),null,2));
fs.writeFileSync('lab05-collection-fail.json',JSON.stringify(mkCollection(true),null,2));
