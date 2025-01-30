const linkMap = {}; // تخزين الروابط ديناميكيًا في الذاكرة

module.exports = ( req, res ) => {
    const fakeLink = req.query.fakeLink || req.url.substring( 1 ); // استخراج اسم الفيك لينك

    if ( linkMap[ fakeLink ] )
    {
        res.writeHead( 302, { Location: linkMap[ fakeLink ] } ); // إعادة توجيه للرابط الأصلي
        res.end();
    } else
    {
        res.status( 404 ).send( "Not Found" );
    }
};

// دالة لإضافة روابط جديدة
module.exports.addLink = ( fake, original ) => {
    linkMap[ fake ] = original;
};
