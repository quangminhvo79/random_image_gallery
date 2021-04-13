function setWinner(data){
    let tmp = JSON.stringify(data);
    localStorage.setItem("winners", tmp);
}

function getWinners(){
    let listWorker = localStorage.getItem("winners");
    if (listWorker) {
        return JSON.parse(listWorker);
    }
    return [];
}

function get_winner(){
    $.ajax({
        url: '/get_winner',
        type: 'GET',
        success: function(winner_name){
            let winners = getWinners();
            if(winners.includes(winner_name)){
                get_winner();
                return;
            }
            winners.push(winner_name);
            winner_url = winner_name;
            setWinner(winners);
            handleStop(winner_name)
        }
    });
}

function change_image_data(){
     $.ajax({
        url: '/new_turn',
        type: 'GET',
        dataType: 'json',
        success: function(data){
            for(let i = 0; i < data.files.length; i++){
                let elem = $('.bee3D--slide').eq(i).find('div');
                elem.css({
                    background: 'url(public/upload/'+ data.files[i] + ') no-repeat 50% 50%',
                    backgroundSize: 'cover'
                });
                elem.data('imageUrl', data.files[i])
            }
        }
    });
}

function handleStop(winner_url){
    var img = new Image();
    img.onload = function () {
        let winnerElm = $('.bee3D--slide').eq(7).find('div');
        let beforeElm = $('.bee3D--slide').eq(6).find('div');
        let afterElm = $('.bee3D--slide').eq(8).find('div');

        if(afterElm.data('imageUrl') == winner_url){
            let dummy = $('.bee3D--slide').eq(1).find('div').data('imageUrl');
            afterElm.css({
                background: 'url(public/upload/'+ dummy + ') no-repeat 50% 50%',
                backgroundSize: 'cover'
            });
            afterElm.data('imageUrl', dummy)
        }

        if(beforeElm.data('imageUrl') == winner_url){
            let dummy = $('.bee3D--slide').eq(8).find('div').data('imageUrl');
            beforeElm.css({
                background: 'url(public/upload/'+ dummy + ') no-repeat 50% 50%',
                backgroundSize: 'cover'
            });
            beforeElm.data('imageUrl', dummy)
        }

        winnerElm.css({
            background: 'url(public/upload/'+ winner_url + ') no-repeat 50% 50%',
            backgroundSize: 'cover'
        });
        winnerElm.data('imageUrl', winner_url)

        slider.el.on('activate', function(event) {
            if (event.index == 7 && need_to_stop ){
                clearInterval(_interval);
                need_to_stop = false;
                setTimeout(function(){
                    winnerElm.addClass('winner-effect');
                }, 700)
                
            } 
        });
    }
    img.src = "/public/upload/" + winner_url;
}
var slider = null;
var _interval = null;            
var need_to_stop = false;
var winner_url = null;
var running = false;

$(function(){
    var demo = document.getElementById('demo');
    slider = new Bee3D(demo, {
        effect: 'carousel',
        listeners: {
            keys: false,
            scroll: false
        },
        loop: {
            enabled: true,
            continuous: true,
            offset: 8
        },
        autoplay: {
            enabled: false,
            speed: 100,
            pauseHover: true
        }
    });

    $(document).on('keyup', function(e){
        console.log(e.keyCode);
        if(e.keyCode == 85){
            window.location.href = '/upload-gallery';
        }else if(e.keyCode == 90){
            //change_image_data()
        }else if(e.keyCode == 32){
            if($('#demo').data('total') == getWinners().length){
                $.toast({ 
                    text : 'Đã Quay Hết', 
                    showHideTransition : 'slide',  
                    bgColor : '#0184ff',             
                    textColor : '#fff',            
                    allowToastClose : false,       
                    hideAfter : 5000,             
                    stack : 5,                    
                    textAlign : 'left',          
                    position : 'top-right' 
                })
                return;
            }
            if(running){
                running = false;
                need_to_stop = true
                get_winner();
            }else{
                running = true;
                $('.winner-effect').removeClass('winner-effect');
                setTimeout(function(){
                    change_image_data()
                }, 500)
                _interval = setInterval(function(){
                    slider.el.next();
                }, 130)
            }
        }
    })
})