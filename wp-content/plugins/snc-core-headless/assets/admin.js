/* SNC admin: media pickers, gallery picker, member repeater. */
(function ($) {
  'use strict';

  // Single image / file picker
  $(document).on('click', '.snc-media__select', function (e) {
    e.preventDefault();
    var $wrap = $(this).closest('.snc-media');
    var isImage = $wrap.data('type') === 'image';
    var frame = wp.media({
      title: isImage ? 'Select image' : 'Select or upload file',
      button: { text: 'Use this' },
      library: isImage ? { type: 'image' } : {},
      multiple: false,
    });
    frame.on('select', function () {
      var att = frame.state().get('selection').first().toJSON();
      $wrap.find('.snc-media__input').val(att.id);
      var preview = isImage
        ? $('<img>', { src: (att.sizes && att.sizes.thumbnail ? att.sizes.thumbnail.url : att.url), alt: '' })
        : $('<span>').text(att.filename || att.title);
      $wrap.find('.snc-media__preview').empty().append(preview);
      $wrap.find('.snc-media__remove').prop('hidden', false);
    });
    frame.open();
  });

  $(document).on('click', '.snc-media__remove', function (e) {
    e.preventDefault();
    var $wrap = $(this).closest('.snc-media');
    $wrap.find('.snc-media__input').val('');
    $wrap.find('.snc-media__preview').empty();
    $(this).prop('hidden', true);
  });

  // Gallery picker (multiple images, keeps order of selection)
  $(document).on('click', '.snc-gallery__select', function (e) {
    e.preventDefault();
    var $wrap = $(this).closest('.snc-gallery');
    var $input = $wrap.find('.snc-gallery__input');
    var frame = wp.media({ title: 'Album photos', button: { text: 'Use these photos' }, library: { type: 'image' }, multiple: 'add' });
    frame.on('open', function () {
      var selection = frame.state().get('selection');
      String($input.val() || '').split(',').filter(Boolean).forEach(function (id) {
        var att = wp.media.attachment(id);
        att.fetch();
        selection.add(att);
      });
    });
    frame.on('select', function () {
      var ids = [];
      var $list = $wrap.find('.snc-gallery__list').empty();
      frame.state().get('selection').each(function (att) {
        var a = att.toJSON();
        ids.push(a.id);
        $('<li>').attr('data-id', a.id).append($('<img>', { src: (a.sizes && a.sizes.thumbnail ? a.sizes.thumbnail.url : a.url), alt: '' })).appendTo($list);
      });
      $input.val(ids.join(','));
    });
    frame.open();
  });

  $(document).on('click', '.snc-gallery__clear', function (e) {
    e.preventDefault();
    var $wrap = $(this).closest('.snc-gallery');
    $wrap.find('.snc-gallery__input').val('');
    $wrap.find('.snc-gallery__list').empty();
  });

  // Committee members repeater
  $(document).on('click', '.snc-repeater__add', function (e) {
    e.preventDefault();
    var $field = $(this).closest('.snc-field');
    var $tbody = $field.find('.snc-repeater tbody');
    var html = $field.find('.snc-repeater__template').html().replace(/__INDEX__/g, String(Date.now()));
    $tbody.append(html);
  });

  $(document).on('click', '.snc-repeater__remove', function (e) {
    e.preventDefault();
    var $tbody = $(this).closest('tbody');
    $(this).closest('tr').remove();
    if ($tbody.children().length === 0) {
      $tbody.closest('.snc-field').find('.snc-repeater__add').trigger('click');
    }
  });
})(jQuery);
