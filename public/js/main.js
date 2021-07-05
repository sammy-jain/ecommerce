$(function(){
  if($('textarea#ta').length){
    CKEDITOR.replace('ta');
  }

  $('a.confirmDeletion').on('click', function(){
    // e.preventDefault();
    if(!confirm('confirm deletion'))return false;
  });
});
