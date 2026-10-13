export async function POST() {
  return Response.json({error:'This endpoint has been retired. Use the repair studio.'}, {status:410, headers:{'Cache-Control':'no-store'}});
}
