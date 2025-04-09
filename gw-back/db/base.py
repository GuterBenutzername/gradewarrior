from abc import ABC, abstractmethod


class DatabaseProvider(ABC):
    @abstractmethod
    def execute_query(self, query: str, params: tuple = ()) -> list[dict]:
        pass

    @abstractmethod
    def execute_command(self, command: str, params: tuple = ()) -> int:
        pass

    @abstractmethod
    def init_db(self) -> None:
        pass
