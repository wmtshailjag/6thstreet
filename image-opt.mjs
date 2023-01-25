import imagemin from "imagemin";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminPngquant from "imagemin-pngquant";
import imageminGifsicle from "imagemin-gifsicle";
import imageminSvgo from "imagemin-svgo";


function image_opt(){
    const paths = [
        {
            src: 'build/static/media/*.{jpg,jpeg,png,gif,svg}',
            dest: 'build/static/media/',
        },
        {
            src: 'build/assets/*.{jpg,jpeg,png,gif,svg}',
            dest: 'build/assets/',
        }
    ];

    paths.forEach(({src, dest}) => {
        try{
            imagemin([src], {
                destination: dest,
                plugins: [
                    imageminMozjpeg(),
                    imageminPngquant({
                        quality: [1, 1],
                        speed: 1,
                        strip: true
                    }),
                    imageminGifsicle(),
                    imageminSvgo()
                ],
            });
        }
        catch(err){
            console.error(err);
        }
    })
}

image_opt();