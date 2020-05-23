<?php

class IfrsLog
{
    public static function writeLog ($objCard, $userId, $changeCash, $changePromo, $itemId, $actionId,
                                     $unitPrice, $grossRev, $netRev, $userSource, $tranId, $sourcePartner = '', $sourcePay = '')
    {
        global $CONFIG_DATA;
        $game = $CONFIG_DATA['gameId'];
        $keyCash = $game . '_' . $userId . '_' . $CONFIG_DATA['suffix_xuCash'];
        $keyPromo = $game . '_' . $userId . '_' . $CONFIG_DATA['suffix_xuPromo'];

        if ($changeCash < 0) //purchase
        {
            $delta = abs($changeCash);
            $curCash = intval(DataProvider::get($keyCash));
            if ($curCash >= $delta)
            {
                $newCash = DataProvider::decrement($keyCash, $delta);

                $changePromo = 0;
                $newPromo = DataProvider::get($keyPromo);
            }
            else
            {
                $changeCash = -$curCash;
                $newCash = DataProvider::decrement($keyCash, $curCash);

                $delta += $changeCash;
                $changePromo = -$delta;
                $newPromo = DataProvider::decrement($keyPromo, $delta);
            }
        }
        else
        {
            if ($changeCash > 0)
            {
                $newCash = DataProvider::increment($keyCash, $changeCash);
            }
            else
            {
                $changeCash = 0;
                $newCash = DataProvider::get($keyCash);
            }

            if ($changePromo > 0)
            {
                $newPromo = DataProvider::increment($keyPromo, $changePromo);
            }
            else
            {
                $changePromo = 0;
                $newPromo = DataProvider::get($keyPromo);
            }
        }

        $objCard->coinCash = $newCash;
        $objCard->coinPromo = $newPromo;
		
        Zf_log::ifrs($game, $userId, $newCash, $newPromo, $changeCash, $changePromo, $itemId, $actionId,
            $unitPrice, $grossRev, $netRev, $userSource, $tranId, $sourcePartner, $sourcePay);
    }

}