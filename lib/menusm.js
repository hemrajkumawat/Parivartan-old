$(function(){

    // menu smothness
    $('.menusm li').click(function() {
	  window.location = $(this).find('a:first').attr('href');
    });
    var dropdown_level = 0;
    $('.menusm li ul').parent().find('a:first').addClass('nav_sub_arrow');
    $('.menusm').children('li').children('a').addClass('top_level');
    $('.menusm').children('li').children('a').removeClass('nav_sub_arrow');
    $('.menusm li').hover(function(){
      if(dropdown_level == 0){
        $('.menusm').find('a').removeClass('nav_sub_arrow_active');
        $(this).addClass('main_hover_left');
        $(this).children('a').addClass('main_hover_right');
        $('.menusm ul').parent().find('a:first').addClass('nav_sub_arrow');
        $('.menusm').children('li').children('a').addClass('top_level');
        $('.menusm').children('li').children('a').removeClass('nav_sub_arrow');
      }
      $(this).find('ul:first').stop(true,true).slideDown(200).show();
      $(this).find('a:first').addClass('nav_sub_arrow_active');
      $('.menusm').children('li').children('a').removeClass('nav_sub_arrow_active');
      dropdown_level++;
    },function(){
      $(this).find('ul:first').stop(true,true).slideUp(0);
      $(this).find('a:first').removeClass('nav_sub_arrow_active');
      dropdown_level--;
      if(dropdown_level == 0){
        $(this).removeClass('main_hover_left');
        $(this).children('a').removeClass('main_hover_right');
       }
    });
	// END of menu smothness
  
})