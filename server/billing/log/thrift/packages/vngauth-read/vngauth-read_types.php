<?php
/**
 * Autogenerated by Thrift
 *
 * DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
 */
include_once $GLOBALS['THRIFT_ROOT'].'/Thrift.php';


class VNGSession_Session {
  static $_TSPEC;

  public $createTime = null;
  public $lastAccess = null;
  public $uin = null;
  public $zin = null;
  public $accountName = null;
  public $hostname = null;
  public $useragent = null;

  public function __construct($vals=null) {
    if (!isset(self::$_TSPEC)) {
      self::$_TSPEC = array(
        1 => array(
          'var' => 'createTime',
          'type' => TType::I32,
          ),
        2 => array(
          'var' => 'lastAccess',
          'type' => TType::I32,
          ),
        3 => array(
          'var' => 'uin',
          'type' => TType::I32,
          ),
        4 => array(
          'var' => 'zin',
          'type' => TType::I32,
          ),
        5 => array(
          'var' => 'accountName',
          'type' => TType::STRING,
          ),
        6 => array(
          'var' => 'hostname',
          'type' => TType::STRING,
          ),
        7 => array(
          'var' => 'useragent',
          'type' => TType::STRING,
          ),
        );
    }
    if (is_array($vals)) {
      if (isset($vals['createTime'])) {
        $this->createTime = $vals['createTime'];
      }
      if (isset($vals['lastAccess'])) {
        $this->lastAccess = $vals['lastAccess'];
      }
      if (isset($vals['uin'])) {
        $this->uin = $vals['uin'];
      }
      if (isset($vals['zin'])) {
        $this->zin = $vals['zin'];
      }
      if (isset($vals['accountName'])) {
        $this->accountName = $vals['accountName'];
      }
      if (isset($vals['hostname'])) {
        $this->hostname = $vals['hostname'];
      }
      if (isset($vals['useragent'])) {
        $this->useragent = $vals['useragent'];
      }
    }
  }

  public function getName() {
    return 'Session';
  }

  public function read($input)
  {
    $xfer = 0;
    $fname = null;
    $ftype = 0;
    $fid = 0;
    $xfer += $input->readStructBegin($fname);
    while (true)
    {
      $xfer += $input->readFieldBegin($fname, $ftype, $fid);
      if ($ftype == TType::STOP) {
        break;
      }
      switch ($fid)
      {
        case 1:
          if ($ftype == TType::I32) {
            $xfer += $input->readI32($this->createTime);
          } else {
            $xfer += $input->skip($ftype);
          }
          break;
        case 2:
          if ($ftype == TType::I32) {
            $xfer += $input->readI32($this->lastAccess);
          } else {
            $xfer += $input->skip($ftype);
          }
          break;
        case 3:
          if ($ftype == TType::I32) {
            $xfer += $input->readI32($this->uin);
          } else {
            $xfer += $input->skip($ftype);
          }
          break;
        case 4:
          if ($ftype == TType::I32) {
            $xfer += $input->readI32($this->zin);
          } else {
            $xfer += $input->skip($ftype);
          }
          break;
        case 5:
          if ($ftype == TType::STRING) {
            $xfer += $input->readString($this->accountName);
          } else {
            $xfer += $input->skip($ftype);
          }
          break;
        case 6:
          if ($ftype == TType::STRING) {
            $xfer += $input->readString($this->hostname);
          } else {
            $xfer += $input->skip($ftype);
          }
          break;
        case 7:
          if ($ftype == TType::STRING) {
            $xfer += $input->readString($this->useragent);
          } else {
            $xfer += $input->skip($ftype);
          }
          break;
        default:
          $xfer += $input->skip($ftype);
          break;
      }
      $xfer += $input->readFieldEnd();
    }
    $xfer += $input->readStructEnd();
    return $xfer;
  }

  public function write($output) {
    $xfer = 0;
    $xfer += $output->writeStructBegin('Session');
    if ($this->createTime !== null) {
      $xfer += $output->writeFieldBegin('createTime', TType::I32, 1);
      $xfer += $output->writeI32($this->createTime);
      $xfer += $output->writeFieldEnd();
    }
    if ($this->lastAccess !== null) {
      $xfer += $output->writeFieldBegin('lastAccess', TType::I32, 2);
      $xfer += $output->writeI32($this->lastAccess);
      $xfer += $output->writeFieldEnd();
    }
    if ($this->uin !== null) {
      $xfer += $output->writeFieldBegin('uin', TType::I32, 3);
      $xfer += $output->writeI32($this->uin);
      $xfer += $output->writeFieldEnd();
    }
    if ($this->zin !== null) {
      $xfer += $output->writeFieldBegin('zin', TType::I32, 4);
      $xfer += $output->writeI32($this->zin);
      $xfer += $output->writeFieldEnd();
    }
    if ($this->accountName !== null) {
      $xfer += $output->writeFieldBegin('accountName', TType::STRING, 5);
      $xfer += $output->writeString($this->accountName);
      $xfer += $output->writeFieldEnd();
    }
    if ($this->hostname !== null) {
      $xfer += $output->writeFieldBegin('hostname', TType::STRING, 6);
      $xfer += $output->writeString($this->hostname);
      $xfer += $output->writeFieldEnd();
    }
    if ($this->useragent !== null) {
      $xfer += $output->writeFieldBegin('useragent', TType::STRING, 7);
      $xfer += $output->writeString($this->useragent);
      $xfer += $output->writeFieldEnd();
    }
    $xfer += $output->writeFieldStop();
    $xfer += $output->writeStructEnd();
    return $xfer;
  }

}

class VNGSession_SessionResult {
  static $_TSPEC;

  public $resultCode = null;
  public $session = null;

  public function __construct($vals=null) {
    if (!isset(self::$_TSPEC)) {
      self::$_TSPEC = array(
        1 => array(
          'var' => 'resultCode',
          'type' => TType::I32,
          ),
        2 => array(
          'var' => 'session',
          'type' => TType::STRUCT,
          'class' => 'VNGSession_Session',
          ),
        );
    }
    if (is_array($vals)) {
      if (isset($vals['resultCode'])) {
        $this->resultCode = $vals['resultCode'];
      }
      if (isset($vals['session'])) {
        $this->session = $vals['session'];
      }
    }
  }

  public function getName() {
    return 'SessionResult';
  }

  public function read($input)
  {
    $xfer = 0;
    $fname = null;
    $ftype = 0;
    $fid = 0;
    $xfer += $input->readStructBegin($fname);
    while (true)
    {
      $xfer += $input->readFieldBegin($fname, $ftype, $fid);
      if ($ftype == TType::STOP) {
        break;
      }
      switch ($fid)
      {
        case 1:
          if ($ftype == TType::I32) {
            $xfer += $input->readI32($this->resultCode);
          } else {
            $xfer += $input->skip($ftype);
          }
          break;
        case 2:
          if ($ftype == TType::STRUCT) {
            $this->session = new VNGSession_Session();
            $xfer += $this->session->read($input);
          } else {
            $xfer += $input->skip($ftype);
          }
          break;
        default:
          $xfer += $input->skip($ftype);
          break;
      }
      $xfer += $input->readFieldEnd();
    }
    $xfer += $input->readStructEnd();
    return $xfer;
  }

  public function write($output) {
    $xfer = 0;
    $xfer += $output->writeStructBegin('SessionResult');
    if ($this->resultCode !== null) {
      $xfer += $output->writeFieldBegin('resultCode', TType::I32, 1);
      $xfer += $output->writeI32($this->resultCode);
      $xfer += $output->writeFieldEnd();
    }
    if ($this->session !== null) {
      if (!is_object($this->session)) {
        throw new TProtocolException('Bad type in structure.', TProtocolException::INVALID_DATA);
      }
      $xfer += $output->writeFieldBegin('session', TType::STRUCT, 2);
      $xfer += $this->session->write($output);
      $xfer += $output->writeFieldEnd();
    }
    $xfer += $output->writeFieldStop();
    $xfer += $output->writeStructEnd();
    return $xfer;
  }

}

?>