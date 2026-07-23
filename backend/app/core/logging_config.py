import logging
import sys
import traceback
from pathlib import Path

LOG_FORMAT = """
==========================================================================
Timestamp: %(asctime)s
Level:     %(levelname)s
Logger:    %(name)s
File:      %(filename)s
Function:  %(funcName)s
Line:      %(lineno)d
Message:   %(message)s
==========================================================================
"""

DATE_FORMAT = "%Y-%m-%d %H:%M:%S %Z"


class TracebackFormatter(logging.Formatter):
    def format(self, record):
        if record.exc_info and not record.exc_text:
            record.exc_text = "".join(
                traceback.format_exception(*record.exc_info)
            )
        if record.exc_text:
            output = f"""
==========================================================================
TIMESTAMP:  {self.formatTime(record, self.datefmt)}
LEVEL:      {record.levelname}
LOGGER:     {record.name}
FILE:       {record.filename}
FUNCTION:   {record.funcName}
LINE:       {record.lineno}
MESSAGE:    {record.getMessage()}

EXCEPTION:
{record.exc_text}
==========================================================================
"""
        else:
            output = self._fmt % {
                "asctime": self.formatTime(record, self.datefmt),
                "levelname": record.levelname,
                "name": record.name,
                "filename": record.filename,
                "funcName": record.funcName,
                "lineno": record.lineno,
                "message": record.getMessage(),
            }
        return output


def setup_logging():
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.DEBUG)
    handler.setFormatter(
        TracebackFormatter(LOG_FORMAT.strip(), datefmt=DATE_FORMAT)
    )

    root_logger.handlers.clear()
    root_logger.addHandler(handler)

    sqlalchemy_logger = logging.getLogger("sqlalchemy.engine")
    sqlalchemy_logger.setLevel(logging.WARN)

    return logging.getLogger("jobpilot")


logger = setup_logging()
