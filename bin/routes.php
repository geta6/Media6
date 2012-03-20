<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;




//--------------------------------------------------------------
$convert = function ($path, Request $req)
{
  while ('/' == substr($path, -1)) {
    $path = substr($path, 0, -1);
  }
  if (null !== $req->get('type')) {
    $path = explode('/', 0 < strlen($path) ? $path : 'media');
    $path = implode('/', array_slice($path, 0, -2));
  }
  return "/$path";
};




//--------------------------------------------------------------
$confirm = function (Request $req) use ($app)
{
  if (null == $app['session']->get('login')) {
    return new Response(
      $app['twig']->render('authenticate.twig', array(
        'mobile' => $app['mb']
      ))
    , 401);
  }

};




//--------------------------------------------------------------
$app->post('/sign/{which}', function ($which, Request $req) use ($app)
{
  if ('in' == $which) {

    $user = $req->get('user');
    $pass = $req->get('pass');

    if (pam_auth($user, $pass)) {
      $app['session']->start();
      $app['session']->set('login', $user);
      $res  = json_encode(array('user' => $user));
      $code = 200;
    } else {
      $res  = json_encode(array());
      $code = 401;
    }

    return $app->stream(function () use ($res) {
      echo $res;
    }, $code, array('Content-Type' => 'application/json'));

  } else if ('out' == $which) {
    $app['session']->set('login', null);
    return $app->stream(function () {
      echo json_encode(array('user' => null));
    }, 200, array('Content-Type' => 'application/json'));

  }

});


$app->match('/test', function () use ($app) {
  return new Response(
    $app['twig']->render('authenticate.twig', array(
      'mobile' => $app['mb']
    ))
  , 401);
});


//--------------------------------------------------------------
$app->match('/stream/{path}', function (Request $req, $path) use ($app)
{
  $size = filesize($path);
  $fold = $req->server->get('HTTP_RANGE');

  return $app->stream(function () use ($path, $size, $fold)
  {

    if (is_null($fold)) {
      header("Content-Length: $size");
      echo file_get_contents($path);
    } else {
      $file = fopen($path, 'rb');
      list($tos, $pan) = explode('=', $_SERVER['HTTP_RANGE']);
      list($ini, $end) = explode('-', $pan);
      header('HTTP/1.1 206 Partial Content');
      header('Content-Length: ' . ($end - $ini + 1));
      header("Content-Range: bytes $pan/$size");
      fseek($file, $ini);
      @ob_end_clean();
      while (!feof($file) && 0 == connection_status() && !connection_aborted()) {
        set_time_limit(0);
        echo fread($file, 8192);
        @flush();
        @ob_flush();
      }
      fclose($file);
    }
    return (string)0;

  }, 200, array('Content-Type' => $req->get('type'), 'Accept-Ranges' => 'bytes'));
})->assert('path', '.*')->convert('path', $convert)->middleware($confirm);




//--------------------------------------------------------------
$app->match('/thumb/{path}', function ($path, Request $req) use ($app)
{
  $size = $req->get('size');
  if (null == $size) $size = 128;
  $app['apc']->space("thumb.$path.$size");

  if ($app['apc']->exist) {

    $img = $app['apc']->fetch();

  } else {

    $stm = $app['pdo']->prepare(is_dir($path)
      ? 'SELECT clip FROM mediaindex WHERE path LIKE :path AND type != :type ORDER BY date ASC'
      : $sql = 'SELECT clip FROM mediaindex WHERE path = :path');
    $stm->execute(array('path' => "$path/%", 'type' => 'dir'));
    $stm = $stm->fetch(PDO::FETCH_ASSOC);

    if (1 < strlen($stm['clip'])) {
      $img = $app['apc']->store($stm['clip'], 60*60*24*7);
    } else {
      $img = file_get_contents(__DIR__ . '/../web/src/img/default.jpg');
    }

    if (128 != $size) {
      $tmp = '/tmp/ms.thumb.'.microtime(true);
      file_put_contents($tmp, $img);
      list($iw, $ih) = getimagesize($tmp);
      $nh = $iw > $ih ? ($ih/$iw) * $size : $size;
      $nw = $iw < $ih ? ($iw/$ih) * $size : $size;
      $oi = imagecreatefromjpeg($tmp);
      $ni = imagecreatetruecolor($nw, $nh);
      imagecopyresampled($ni, $oi, 0, 0, 0, 0, $nw, $nh, $iw, $ih);
      ob_start();
      imagejpeg($ni, NULL, 60);
      $img = ob_get_contents();
      ob_end_clean();
      $app['apc']->store($img);
      unlink($tmp);
    }

  }

  return new Response($img, 200, array(
    'Cache-Control' => 's-maxage=5',
    'Content-Type'  => 'image/jpeg',
  ));

})->assert('path', '.*')->convert('path', $convert);




//--------------------------------------------------------------
$app->match('/data/{path}', function ($path, Request $req) use ($app)
{
  $app['apc']->space("data.$path");

  return $app->stream(function () use ($app, $req, $path)
  {
    if ($app['apc']->exist) {
      echo $app['apc']->fetch();
    } else {
      if (file_exists($path)) {
        $unit = $app['pdo']->prepare('SELECT * FROM mediaindex WHERE path LIKE :path AND deep = :deep');
        $unit->execute(array('path' => "$path/%", 'deep' => substr_count($path, '/')+1));
        $unit = $unit->fetchAll(PDO::FETCH_ASSOC);
        $self = $app['pdo']->prepare('SELECT * from mediaindex WHERE path = :path');
        $self->execute(array('path' => $path));
        $self = $self->fetch(PDO::FETCH_ASSOC);
        if ($self['bind']) {
          $time = time();
          foreach ($unit as $k => $v) {
            switch ($v['type']) {
              case 'mp3': $type = 'audio/mp3'; break;
              case 'mp4': $type = 'video/mp4'; break;
              default   : $type = false;       break;
            }
            if ($type) {
              $subst = '/stream'.$v['path'];
              $stamp = dechex($time+(60*45));
              $unit[$k]['hash'] = $subst.'/'.md5($subst.'/'.$app['nginx.secret_hash'].'/'.$stamp).'/'.$stamp;
              $unit[$k]['type'] = $type;
            }
          }
        }
        echo $app['apc']->store(json_encode(
          array(
            'html' => $app['twig']->render('modeling.twig', array(
              'self'   => $self,
              'units'  => $unit,
              'mobile' => $app['mb'],
            ))
          )
        ));
      } else {
        echo json_encode(array(
          'html' => 'Document Not Found',
        ));
      }
    }

  }, 200, array('Content-Type' => 'application/json'));
})->middleware($confirm)->assert('path', '.*')->convert('path', $convert);




//--------------------------------------------------------------
$app->match('/', function (Request $req) use ($app)
{
  return $app['twig']->render('structure.twig', array(
    'mobile' => $app['mb']
  ));
})->middleware($confirm);
