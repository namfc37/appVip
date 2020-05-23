CÁC FEATURE ĐÃ LÀM

1. Machine
- Namespace: gv.userMachine
- Packet defines: /src/Network/packet_machine.js
- Các class liên quan:
    + Machine (/src/Machine/Machine.js): Object hiển thị máy bọ trên tầng mây
    + MachineManager (/src/Machine/MachineManager.js): Lớp singleton, là controller chính, gửi/nhận các request/response của máy bọ, quản lý các popup liên quan. Mọi thao tác máy bọ được gọi từ các component khác nên thông qua singleton này.
    Ex: gv.userMachine.requestUnlockMachine(MA0);
    Ex: gv.userMachine.showPopupMachineInfo(0, MA0);
    + Các popup: MachinePopupInfo, MachinePopupProduce, MachinePopupUnlock, MachinePopupUnlockInfo, MachinePopupUpgrade
- Bugs:
    + Khi sản xuất các item tiếp theo trong hàng đợi, chưa tính được thời gian kết thúc sản xuất của item theo buff effect của chậu trên tầng mây -> sai thời gian sản xuất
    + Hiển thị skin theo level của máy chưa đúng (Rule đúng: cứ 3 level đổi skin một lần).

2. Các features sau có chung cấu trúc: một singleton làm controller, các lớp popup/view liên quan, các thao tác đều gọi qua singleton.
- Arcade: Nhóm các feature nhỏ như: Đúc chậu, Săn kho báu, Câu cá
    + Folder: /src/Arcade
    + Namespace: gv.arcade
    + Problems:
        * Chưa làm mờ các item không được chọn.
        * Dùng ClippingNode để clip các spine NPC, nhưng bị lỗi render trên mobile.
- Chest (Rương hải tặc)
    + Folder: /src/Chest
    + Namespace: gv.chest
- DailyGift (Quà hằng ngày)
    + Folder: /src/DailyGift
    + Namespace: gv.dailygift
- Dice (Săn kho báu)
    + Folder: /src/Dice
    + Namespace: gv.dice
- Smithy (Đúc chậu)
    + Folder: /src/Smithy
    + Namespace: gv.smithy
- Tom
    + Folder: /src/Tom
    + Namespace: gv.tomkid
- Wheel (Vòng quay)
    + Folder: /src/Wheel
    + Namespace: gv.wheel
- IBShop
    + Folder: /src/IBShop.js
    + Namespace: gv.ibshop
    + Problems:
        * IBShop bị freeze một vài giây khi init lần đầu do số lượng item lớn, thời gian init một item lâu.
- Background
    + Folder: /src/Background.js
    + Namespace: gv.background

3. Lưu ý:
- Mỗi feature có một file packet đi kèm (trong /src/Network), gồm define của các request/response tương ứng với feature đó.
- Response sẽ được nhận ở lớp network (function onReceivedPacket), và pass sang cho controller tương ứng của feature đó (/src/Network/network.js).
- Khi define request/response, phải thực hiện mapping reponse. Ex: network.packetMap[gv.CMD.GACHA_GET_REWARD] = network.chest.OpenResponse;