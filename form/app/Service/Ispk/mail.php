<?php


use App\Service\Logging\LoggerPool;
class Mail
{

    /**
     * Метод для отправки сообщения по электронной почте (версия 2)
     * Исправлена кодировка заголовка
     *
     * @param string $to_address	адрес получателя
     * @param string $to_name		имя получателя
     * @param string $from_address	адрес отправителя
     * @param string $from_name		имя отправителя
     * @param string $subject		тема сообщения
     * @param string $message		тело сообщения
     * @param string $to_encoding	кодировка сообщения
     * @param string $attach_files	прикрепленные файлы
     * @return boolean
     */
    public static function post_mail($to_address = '', $to_name = '', $from_address = '', $from_name = '', $subject = '', $message = '', $to_encoding = '', $attach_files = array(), $bcc = '', $reply_to = '')
    {
        $message       = self::convertMessage($message);
        $from_encoding = strtolower(params::$params['encoding']['value']);
        $to_encoding   = strtolower($to_encoding === '' ? params::$params['encoding']['value'] : $to_encoding );

        try {
            $SwiftMessage = (new Swift_Message($subject))
                    ->setFrom(array($from_address => $from_name))->setCharset($to_encoding)
                    ->setTo(array($to_address => $to_name))->setCharset($to_encoding)
                    ->setBody($message, 'text/html')->setCharset($to_encoding);
            foreach ($attach_files as $file_name)
                $SwiftMessage->attach(Swift_Attachment::fromPath($file_name))->setCharset($to_encoding);

            
            if (cfg('email_from/transport','sendMail')=='sendMail') {
                $transport = new Swift_SendmailTransport();
            }
            elseif  (cfg('email_from/transport','sendMail')=='smtp'){
                $transport = new Swift_SmtpTransport(cfg('email_from/smtp/url'), cfg('email_from/smtp/port'));
                if (cfg('email_from/smtp/password')) $transport->setPassword(cfg('email_from/smtp/password'));
                if (cfg('email_from/smtp/login')) $transport->setUsername(cfg('email_from/smtp/login'));
            }
            
            $mailer = new Swift_Mailer($transport);

            $result = $mailer->send($SwiftMessage);


            self::sendLog('Ок', array('result' => $result, 'to_address' => $to_address, 'to_name' => $to_name, 'from_address' => $from_address, 'from_name' => $from_name, 'subject' => $subject, 'body' => $message, 'attach_files' => json_encode($attach_files)));
            return $result;
        } catch (Exception $e) {
            self::sendLog($e->getMessage(), array('result' => $result, 'to_address' => $to_address, 'to_name' => $to_name, 'from_address' => $from_address, 'from_name' => $from_name, 'subject' => $subject, 'body' => $message, 'attach_files' => json_encode($attach_files)));
            return false;
        }
    }

    public static function convertMessage($message, $params = array())
    {
        //!!!!!!!!Если необходимо отправить в тексте письма картинку (ИЛИ НЕСКОЛЬКО) НЕОБХОДИМО в начале текста письма
        //!!!!!!!!добавить <img> тогда <img> будет убит кодом ниже, а ваши картинки будут жить.
        //Проверяем есть ли в тексте сообщения картинка, и предполагая что - это шапка удаляем её.
        $pos1_img = strpos($message, '<img');
        if ($pos1_img) {
            //			print_r(htmlspecialchars($message));
            $pos2_img   = strpos($message, '>', $pos1_img);
            $str1_kusok = substr($message, 0, $pos1_img);
            $str2_kusok = substr($message, $pos2_img + 1);
            $message    = $str1_kusok.$str2_kusok;
            //Проверяем, была ли наша картинка завернута в div, если да и div пустой - удаляем див!
            $pos1_div   = strpos($message, '<div');
            $pos2_div   = strpos($message, '>', $pos1_div);
            $pos3_div   = strpos($message, '</div>', $pos2_div);
            if (($pos1_div && $pos2_div && $pos3_div) || ($pos1_div === 0 && $pos2_div && $pos3_div)) {
                $str_pusto = substr($message, $pos2_div + 1, $pos3_div - $pos2_div - 1);
                if (trim($str_pusto) == '') {
                    $str1_div = substr($message, 0, $pos1_div);
                    $str2_div = substr($message, $pos3_div + 6);
                    $message  = $str1_div.$str2_div;
                }
                $message = trim($message);
                //Если после div шли br, удаляем br------------------------------------------------------
                while ((substr($message, 0, 4) == '<br>') || (substr($message, 0, 5) == '</br>') || (substr($message, 0, 5) == '<br/>')) {
                    if (substr($message, 0, 4) == '<br>') {
                        $message = trim(substr($message, 4));
                    }
                    if (substr($message, 0, 5) == '</br>') {
                        $message = trim(substr($message, 5));
                    }
                    if (substr($message, 0, 5) == '<br/>') {
                        $message = trim(substr($message, 5));
                    }
                }
            }
        }
        //Ищем футер в тексте письма, удаляем его и добавляем наш
        $mas_boti1  = strpos(htmlspecialchars($message), htmlspecialchars('С уважением,<br>Служба поддержки пользователей'));
        $mas_boti2  = strpos($message, '<font color="lightgray">--<br/>'); //Такая бредовая конструкция нужна
        $mas_boti22 = strpos($message, 'С уважением,');                   // из-за глюков strpos с кодировкой UTF-8
        if ($mas_boti1) {
            $message = substr(htmlspecialchars($message), 0, $mas_boti1);
            $message = htmlspecialchars_decode($message);
        } elseif ($mas_boti2 && $mas_boti22 && (($mas_boti22 - $mas_boti2) < 35)) {
            $message = substr($message, 0, $mas_boti2);
        }
        $message = trim($message);
        //Если перед ботинками шли br, удаляем br------------------------------------------------------
        while ((substr($message, -4) == '<br>') || (substr($message, -5) == '</br>') || (substr($message, -5) == '<br/>')) {
            if (substr($message, -4) == '<br>') {
                $message = trim(substr($message, 0, -4));
            }
            if (substr($message, -5) == '</br>') {
                $message = trim(substr($message, 0, -5));
            }
            if (substr($message, -5) == '<br/>') {
                $message = trim(substr($message, 0, -5));
            }
        }


        $wrapWithHtmlTag = true;
        if (is_array($params) && ! empty($params['dontWrapWithHtmlTag'])) {
            $wrapWithHtmlTag = false;
        }
        if ($wrapWithHtmlTag) {
            $message = (strpos($message, '<html>') === false ? '<html>' : '') . $message . '</html>';
        }

        return $message;
    }

    protected static $loggerPool = false;
    public static function sendLog($message, $data = array())
    {
        if (empty(self::$loggerPool)) {
            $facility         = 'Email';
            self::$loggerPool = new LoggerPool();
            self::$loggerPool->add('graylog', LoggerPool::create($facility, 'graylog'));
        }
        self::$loggerPool->info($message, array_merge([
            'sess-id' => session_id(),
            'hostname'=>explode('/', \params::$mainHost)[0],
            'pid' => posix_getpid(),
            'date' => date('c'),
            'ip' => lib::clientIP(),

            ], $data)
        );
    }
}